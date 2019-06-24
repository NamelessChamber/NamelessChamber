module Admin::ClassroomPsetsHelper
	def fulldate(datetime)
		datetime.strftime("%Y-%m-%d %I:%M:%S %p")
	end
end
